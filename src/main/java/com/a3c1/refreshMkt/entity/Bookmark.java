package com.a3c1.refreshMkt.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Bookmark {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "bookmark_id")
    private Integer bookmark_id;

    //여러 북마크를 한 사람이 가질 수 있음
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User user;

    //여러 북마크를 한 물건이 가질 수 있음??
    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Product product;

    @Column(nullable = false)
    private boolean status;

    public static Bookmark createBookmark(User user, Product product) {
        return new Bookmark(
                null,
                user,
                product,
                true
        );
    }

    public void deleteBookmark(Product product) {
        this.status = false;
    }

    // Getter 및 Setter
    public Boolean getStatus() {
        return status;
    }

    public void setStatus(Boolean status) {
        this.status = status;
    }
}
