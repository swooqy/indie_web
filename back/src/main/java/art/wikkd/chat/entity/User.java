package art.wikkd.chat.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "users", schema = "chat_db")
@Getter
@Setter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = "messages")
public class User {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@EqualsAndHashCode.Include
	private Long id;

	@Column(nullable = false, unique = true, updatable = false)
	private UUID uuid;

	@Column(nullable = false, length = 100)
	private String username;

	@Column(length = 1000)
	private String metadata;

	@Column(name = "color_hex", nullable = false, length = 9)
	private String colorHex;

	@OneToMany(mappedBy = "sender", fetch = FetchType.LAZY)
	private List<Message> messages = new ArrayList<>();
}
