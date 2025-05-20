package com.a3c1.refreshMkt.service;

import com.a3c1.refreshMkt.entity.User;
import com.a3c1.refreshMkt.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;


// @param : 메소드의 매개변수 설명
// @return : 메소드 반환값 설명
// @throws : 예외 설명
// 위 설명은 밑 메서드 위에 적혀있는 설명

/**
 * 사용자 관련 비즈니스 로직을 처리하는 서비스 클래스
 * 사용자 정보의 CRUD 작업과 관련된 모든 비즈니스 로직을 담당
 */
@Service
@Transactional
public class UserService {
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);
    
    private final UserRepository userRepository;

    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * 사용자 ID로 사용자 조회
     * @param userId 사용자 ID
     * @return 조회된 사용자 정보 (Optional)
     * 이 주석 블록처럼 주석을 달면 Javadoc을 통해 코드에 대한 설명을 문서화 할 수 있다.
     */
    public Optional<User> findById(Integer userId) {
        logger.debug("Finding user with ID: {}", userId);
        return userRepository.findById(userId);
    }

    
    /**
     * 사용자 정보 저장
     * @param user 저장할 사용자 정보
     * @return 저장된 사용자 정보
     */
    public User save(User user) {
        logger.debug("Saving user: {}", user);
        return userRepository.save(user);
    }

    /**
     * 모든 사용자 조회
     * @return 전체 사용자 목록
     */
    public List<User> getAllUsers() {
        logger.debug("Getting all users");
        return userRepository.findAll();
    }

    /**
     * 사용자 ID로 사용자 조회
     * @param id 사용자 ID
     * @return 조회된 사용자 정보 (Optional)
     */
    public Optional<User> getUserById(Integer id) {
        logger.debug("Getting user by ID: {}", id);
        return userRepository.findById(id);
    }

    /**
     * 사용자 이름으로 사용자 조회
     * @param userName 사용자 이름
     * @return 조회된 사용자 정보 (Optional)
     */
    public Optional<User> getUserByName(String userName) {
        logger.debug("Getting user by name: {}", userName);
        return userRepository.findByUserName(userName);
    }

    /**
     * 카카오 ID로 사용자 조회
     * @param kakaoId 카카오 ID
     * @return 조회된 사용자 정보 (Optional)
     */
    public Optional<User> getUserByKakaoId(Long kakaoId) {
        logger.debug("Getting user by Kakao ID: {}", kakaoId);
        return userRepository.findByKakaoId(kakaoId);
    }

    /**
     * 새로운 사용자 생성
     * @param user 생성할 사용자 정보
     * @return 생성된 사용자 정보
     * @throws IllegalArgumentException 필수 필드가 누락된 경우
     */
    @Transactional
    public User createUser(User user) {
        logger.debug("Creating new user: {}", user);
        
        // 필수 필드 검증
        if (user.getKakaoId() == null) {
            logger.error("KakaoId is required for user creation");
            throw new IllegalArgumentException("KakaoId is required");
        }

        // 이미 존재하는 카카오 ID 체크
        if (userRepository.findByKakaoId(user.getKakaoId()).isPresent()) {
            logger.error("User with kakaoId {} already exists", user.getKakaoId());
            throw new IllegalArgumentException("User with this kakaoId already exists");
        }

        // userName이 null이면 임시 이름 설정
        if (user.getUserName() == null) {
            user.setUserName("임시사용자_" + user.getKakaoId());
        }

        try {
            User savedUser = userRepository.save(user);
            logger.debug("Successfully created user: {}", savedUser);
            return savedUser;
        } catch (Exception e) {
            logger.error("Error creating user: {}", e.getMessage());
            throw new RuntimeException("Failed to create user", e);
        }
    }

    /**
     * 카카오 ID로 사용자 조회 또는 생성
     * @param kakaoId 카카오 ID
     * @return 조회되거나 생성된 사용자 정보
     */
    @Transactional
    public User getOrCreateUser(Long kakaoId) {
        logger.debug("Getting or creating user with Kakao ID: {}", kakaoId);
        
        return userRepository.findByKakaoId(kakaoId)
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setKakaoId(kakaoId);
                    newUser.setUserName("임시사용자_" + kakaoId);
                    return createUser(newUser);
                });
    }

    /**
     * 사용자 정보 업데이트
     * @param id 업데이트할 사용자 ID
     * @param updatedUser 업데이트할 사용자 정보
     * @return 업데이트된 사용자 정보
     * @throws RuntimeException 사용자를 찾을 수 없을 때
     */
    @Transactional
    public User updateUser(Integer id, User updatedUser) {
        logger.debug("Updating user with ID {}: {}", id, updatedUser);
        return userRepository.findById(id)
                .map(user -> {
                    if (updatedUser.getUserName() != null && !updatedUser.getUserName().isEmpty()) {
                        user.setUserName(updatedUser.getUserName());
                    }
                    if (updatedUser.getLocation_x() != 0) {
                        user.setLocation_x(updatedUser.getLocation_x());
                    }
                    if (updatedUser.getLocation_y() != 0) {
                        user.setLocation_y(updatedUser.getLocation_y());
                    }
                    User savedUser = userRepository.save(user);
                    logger.debug("Successfully updated user: {}", savedUser);
                    return savedUser;
                })
                .orElseThrow(() -> {
                    logger.error("User not found with ID: {}", id);
                    return new RuntimeException("User not found with id: " + id);
                });
    }

    /**
     * 사용자 삭제
     * @param id 삭제할 사용자 ID
     * @throws RuntimeException 사용자 삭제 실패 시
     */
    @Transactional
    public void deleteUser(Integer id) {
        logger.debug("Deleting user with ID: {}", id);
        try {
            userRepository.deleteById(id);
        } catch (Exception e) {
            logger.error("Error deleting user with ID {}: {}", id, e.getMessage());
            throw new RuntimeException("Failed to delete user", e);
        }
    }
}
